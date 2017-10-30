/* */ 
"format cjs";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
var obs = new Observable(obs => {
    var i = 0;
    setInterval(_ => obs.next(++i), 1000);
});
obs.map(i => `${i} seconds elapsed`).subscribe(msg => console.log(msg));
// #enddocregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JzZXJ2YWJsZV9wYXRjaGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvZXhhbXBsZXMvZmFjYWRlL3RzL2FzeW5jL29ic2VydmFibGVfcGF0Y2hlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FDTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGlCQUFpQjtPQUNuQyx1QkFBdUI7QUFFOUIsSUFBSSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsR0FBRztJQUMxQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDVixXQUFXLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN4QyxDQUFDLENBQUMsQ0FBQztBQUNILEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3hFLGdCQUFnQiIsInNvdXJjZXNDb250ZW50IjpbIi8vICNkb2NyZWdpb24gT2JzZXJ2YWJsZVxuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdyeGpzL09ic2VydmFibGUnO1xuaW1wb3J0ICdyeGpzL2FkZC9vcGVyYXRvci9tYXAnO1xuXG52YXIgb2JzID0gbmV3IE9ic2VydmFibGUob2JzID0+IHtcbiAgdmFyIGkgPSAwO1xuICBzZXRJbnRlcnZhbChfID0+IG9icy5uZXh0KCsraSksIDEwMDApO1xufSk7XG5vYnMubWFwKGkgPT4gYCR7aX0gc2Vjb25kcyBlbGFwc2VkYCkuc3Vic2NyaWJlKG1zZyA9PiBjb25zb2xlLmxvZyhtc2cpKTtcbi8vICNlbmRkb2NyZWdpb25cbiJdfQ==